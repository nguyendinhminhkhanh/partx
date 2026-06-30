import Navbar from "../Navbar/Navbar";
interface MainLayoutProps {
  children: React.ReactNode;
}
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div >
      <Navbar></Navbar>
      <div className="containe mt-4">{children}</div>
    </div>
  );
}