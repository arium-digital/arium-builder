const CloseIcon = ({
  width = 14,
  height = 15,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line
      x1="1.35355"
      y1="0.646447"
      x2="14.3536"
      y2="13.6464"
      stroke="#FFFFF1"
    />
    <line
      y1="-0.5"
      x2="18.3848"
      y2="-0.5"
      transform="matrix(-0.707107 0.707107 0.707107 0.707107 14 1)"
      stroke="#FFFFF1"
    />
  </svg>
);

export default CloseIcon;
