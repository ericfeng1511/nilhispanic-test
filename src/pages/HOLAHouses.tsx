import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';

const HolaHousesPage = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection
          title={<><span className="font-bold">HOLA</span> <span className="heading-gradient-light">HOUSES</span></>}
          subtitle="Creating a home away from home for Hispanic student-athletes."
          backgroundImageUrl="/images/hola-houses.png"
          backgroundPosition="center"
          className="pb-96"
        />
      </main>
      <Footer />
    </>
  );
};

export default HolaHousesPage;
