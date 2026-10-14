import { Hero } from "@/components/Hero";
import { About, Capabilities, Certifications, Contact, Credentials, Experience, Journey, Work } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Experience />
      <Journey />
      <About />
      <Capabilities />
      <Certifications />
      <Credentials />
      <Contact />
    </>
  );
}
