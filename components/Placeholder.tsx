/**
 * Placeholder de imagen/video — reemplaza los `image-slot` del HTML original
 * mientras no haya assets reales. Caja con gradiente sutil + etiqueta centrada.
 */
export default function Placeholder({
  label,
  dark = false,
  style,
}: {
  label: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 16,
        boxSizing: 'border-box',
        background: dark
          ? 'linear-gradient(135deg, #1c1c1c, #0c0c0c)'
          : 'linear-gradient(135deg, #e6e4df, #cfccc4)',
        color: dark ? '#7a7a7a' : '#8a8880',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {label}
    </div>
  );
}
