// import { Bebas_Neue, Poppins } from "next/font/google";
// import { Toaster } from "@/components/ui/sonner";
// import PrivateRoute from "@/lib/PrivateRoute";
// import AdminSideNav from "../components/AdminSideNav";

// const bebas = Bebas_Neue({
//   variable: "--font-bebas",
//   subsets: ["latin"],
//   weight: "400", // Add this line

// });

// const poppins = Poppins({
//   variable: "--font-poppins",
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Add this line
// });


// export const metadata = {
//   title: "Company Portal - RotaHire",
//   description: "employees with RotaHire",
// };

// export default function RootLayout({ children }) {
//   return (
//       <div
//         className={`${bebas.variable} ${poppins.variable} antialiased dark`}
//       >
//         <div className="flex w-full">
//           <div className="w-2/12 h-screen fixed">
//             <AdminSideNav />
//           </div>
//           <div className="w-10/12 ml-auto py-16 px-10">
//             <PrivateRoute>
//                 {children}
//                 <Toaster richColors  />
//             </PrivateRoute>
//           </div>
//         </div>

//         <div className='w-[700px] h-[500px] fixed -top-80  left-0 right-0 m-auto bg-cranberry/75 -z-10 rounded-full blur-[20rem]'></div>

//       </div>
//   );
// }
