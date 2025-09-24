import { Bebas_Neue, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400", // Add this line

});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Add this line
});


export const metadata = {
  title: "RotaHire",
  description: "Rotaract Hiring Portal",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${bebas.variable} ${poppins.variable} antialiased dark`}
      >
        {children}
        <Toaster richColors  />

      </body>
    </html>
  );
}
