export type BarcodeInsights = "GENERATED" | "DOWNLOADED";

export interface GetBarcodeInsights {
  data: BarcodeType[] | null;
  error: string | undefined;
  status: number;
  statusText: string;
}
export interface TotalBarcodesGeneratedType {
  data: number | null;
  error: string | undefined;
  status: number;
  statusText: string;
}

export type BarcodeType = {
  id: number;
  barcode_value: string;
  generated_count: number;
  downloaded_count: number;
};

export interface CreateBarcodeReturnType {
  isSuccess: boolean;
  barcodeValue: string;
  errorMessage: string | undefined;
}
