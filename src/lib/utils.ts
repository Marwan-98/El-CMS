import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { Bounce, toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCorrectDate(dateString: string | null): string | null {
  if (!dateString) {
    return null;
  }

  const [day, month, year] = format(dateString, "dd-MM-yyyy").split("-");

  const date = new Date(Date.UTC(+year, +month - 1, +day));

  const correctDate = date.toISOString();

  return correctDate;
}

export function setMetaData(filePath: string, key: string, value: string, execSync: (command: string) => void) {
  const command = `powershell.exe -Command "Set-Content -Path '${filePath}:${key}' -Value '${value}'"`;
  execSync(command);
}

export function showNotification(message: string, type: string) {
  switch (type) {
    case "success":
      return toast.success(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        rtl: true,
      });
    default:
      break;
  }
}
