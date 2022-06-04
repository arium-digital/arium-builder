const CircularImageClip = ({
  imageUrl,
  alt,
  width,
  className,
}: {
  imageUrl: string;
  alt?: string;
  width: number;
  className?: string;
}) => {
  return (
    <img
      style={{ clipPath: "circle(closest-side)", width }}
      alt={alt}
      src={imageUrl}
      className={className}
    />
  );
};

export default CircularImageClip;
