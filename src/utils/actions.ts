export const evalError = (error: any): string | undefined => {
  if (error?.message?.includes("TypeError") || error instanceof TypeError) {
    console.error("TypeError", error);
    const message = networkError;
    return message;
  }

  if (error?.message) {
    return `${error.message}`;
  }

  if (error) {
    const message = "Something went wrong";
    return message;
  }
};

export const networkError = "Network error or invalid response (VPN?)";
