/**
 * Photo — imagen real para los slots de la sección blanca. Llena el contenedor
 * (que tiene overflow:hidden) y su alto 118% deja margen para el parallax que
 * mueve este mismo elemento (firstElementChild) en WhiteSection.
 */
export default function Photo({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
    />
  );
}
