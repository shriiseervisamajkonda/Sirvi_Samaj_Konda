const testLogin = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@seervisamajkonda.org',
        password: 'Admin@123456'
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response Body:', data);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
};

testLogin();
