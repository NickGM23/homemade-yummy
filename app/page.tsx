import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Container } from "@/components/shared/container";
import { Title } from "@/components/shared/title";
import { Categories } from "@/components/shared/categories";

export default function Home() {
  return (
    <main className="min-h-screen bg-white rounded-3xl">
      <Container className="mt-5">
        <Title text="Всі смаколики" size="lg" className="font-extrabold" />
      </Container>

      <div className="sticky top-0 bg-white py-5 shadow-lg shadow-black/5">
        <Container className="flex items-center justify-between ">
          <Categories />
          {/* <SortPopup /> */}
        </Container>
      </div>
    </main>
  );
}
