import {
  getBarcodeInsights,
  getTotalBarcodesGenerated,
} from "@/utils/supabase/crud";

export const Insights = async () => {
  const { data, error } = await getBarcodeInsights();
  const { data: totalBarcodes, error: totalBarcodesError } =
    await getTotalBarcodesGenerated();

  return (
    <div>
      <h2>Statistikk & innsikt</h2>
      {error && <p>{error}</p>}
      {!!totalBarcodes && (
        <ul>
          <li>Antall strekkoder generert: {totalBarcodes}</li>
        </ul>
      )}

      {!!data && (
        <ul>
          {data &&
            data.map((strekkode, index: number) => {
              return (
                <li key={index}>
                  {index + 1} {strekkode.barcode_value}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};
