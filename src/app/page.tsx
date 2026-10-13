import { Hero } from "@/components/Hero";
import { About, Capabilities, Certifications, Contact, Credentials, Experience, Work } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Experience />
      <About />
      <Capabilities />
      <Certifications />
      <Credentials />
      <Contact />
    </>
  );
}
