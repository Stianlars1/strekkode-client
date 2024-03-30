import "./css/loader.css";
export const Loader = ({ widthAndHeight }: { widthAndHeight?: number }) => {
  const width = widthAndHeight || 24;

  const widthAndHeightInPixels = `${width}px`;
  return (
    <div
      className="loader"
      style={{ width: widthAndHeightInPixels, height: widthAndHeightInPixels }}
    ></div>
  );
};
