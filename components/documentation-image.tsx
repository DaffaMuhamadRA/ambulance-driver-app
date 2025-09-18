"use client";

import { useState } from "react";

interface DocumentationImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function DocumentationImage({ src, alt, className }: DocumentationImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc("/placeholder.jpg");
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}