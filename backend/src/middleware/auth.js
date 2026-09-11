import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

// Middleware to verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Resiliently fetch user (attempt with permissions column first)
    let user;
    const { data: userDataWithPerm, error: userErr1 } = await supabase
      .from('users')
      .select('id, name, phone, email, role, role_id, is_active, panchayat_family_id, permissions')
      .eq('id', decoded.id)
      .maybeSingle();

    if (userErr1 || !userDataWithPerm) {
      const { data: userDataFallback, error: userErr2 } = await supabase
        .from('users')
        .select('id, name, phone, email, role, role_id, is_active, panchayat_family_id')
        .eq('id', decoded.id)
        .maybeSingle();
      if (userErr2 || !userDataFallback || !userDataFallback.is_active) {
        return res.status(401).json({ success: false, message: 'User not found or account is inactive' });
      }
      user = userDataFallback;
    } else {
      if (!userDataWithPerm.is_active) {
        return res.status(401).json({ success: false, message: 'Account is inactive' });
      }
      user = userDataWithPerm;
    }

    // Fetch user role permissions if role_id is present
    let permissions = [];
    if (user.role_id) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('permissions')
        .eq('id', user.role_id)
        .maybeSingle();
      if (roleData && Array.isArray(roleData.permissions)) {
        permissions = [...roleData.permissions];
      }
    }

    // Merge with user-level permissions
    if (Array.isArray(user.permissions)) {
      permissions = [...new Set([...permissions, ...user.permissions])];
    } else if (user.role === 'developer' || user.role === 'super_admin') {
      permissions = [...new Set([...permissions, 'can_export_data', 'can_view_lekha_jokha', '*'])];
    }

    req.user = {
      ...user,
      permissions,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
  }
};

// Dynamic RBAC Authorization Middleware (supports role names OR permission keys)
export const authorize = (...rolesOrPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Master bypass for developer and super_admin
    if (req.user.role === 'developer' || req.user.role === 'super_admin' || req.user.permissions?.includes('*')) {
      return next();
    }

    // Check if user's role is in the allowed list
    const hasRole = rolesOrPermissions.includes(req.user.role);

    // Check if user has any of the required granular permission strings
    const hasPermission = rolesOrPermissions.some((perm) => req.user.permissions?.includes(perm));

    if (!hasRole && !hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

// Optional Auth (attaches user if valid token present, otherwise proceeds as guest)
export const optionalAuth = async (req, _res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('id, name, phone, email, role, is_active, panchayat_family_id')
        .eq('id', decoded.id)
        .maybeSingle();
      if (user && user.is_active) {
        req.user = user;
      }
    } catch {
      // ignore token error for optional auth
    }
  }
  next();
};
