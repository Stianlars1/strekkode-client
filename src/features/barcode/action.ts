import { createBarcode } from "@/utils/supabase/crud";

export const generateBarcode = async (
  _currentState: unknown,
  formData: FormData
) => {
  const barcode = formData.get("barcode") as string;
  if (!barcode) {
    return {
      isSuccess: false,
      barcodeValue: "",
      errorMessage: "Du må skrive inn en verdi for strekkoden",
      ts: Date.now(),
    };
  }
  return await createBarcode(barcode);
};
