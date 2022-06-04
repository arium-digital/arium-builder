export const AriumCloseIcon = ({ color }: { color?: string }) => {
  return (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
      <line
        x1="24.1768"
        y1="0.176777"
        x2="1.17678"
        y2="23.1768"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
      <line
        y1="-0.25"
        x2="32.5269"
        y2="-0.25"
        transform="matrix(0.707107 0.707107 0.707107 -0.707107 1 0)"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
    </svg>
  );
};

export const AriumMenuIcon = ({ color }: { color?: string }) => {
  return (
    <svg width="37" height="7" viewBox="0 0 37 7" fill="none">
      <line
        x1="37"
        y1="0.25"
        x2="2.18557e-08"
        y2="0.250003"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
      <line
        x1="37"
        y1="6.25"
        x2="2.18557e-08"
        y2="6.25"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
    </svg>
  );
};
