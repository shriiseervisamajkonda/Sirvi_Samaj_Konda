import { useState } from 'react';

const LazyImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  placeholderClassName = '',
  fallbackSrc = '/hero_background.webp',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const finalSrc = error ? fallbackSrc : src || fallbackSrc;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer Placeholder while image is loading */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-[#FAF1E0] animate-pulse z-0 ${placeholderClassName}`}
        />
      )}

      {/* Actual Image */}
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
          }
          setIsLoaded(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-90'
        } ${imgClassName}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;

