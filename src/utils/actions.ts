export const evalError = (error: any): string | undefined => {
  if (error?.message?.includes("TypeError") || error instanceof TypeError) {
    const message = "Network error or invalid response (VPN?)";
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
