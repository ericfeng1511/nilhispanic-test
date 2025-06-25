import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WhatsNILPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-nil-navy">
      <Header />
      <main className="flex-grow">
        <section className="relative pt-28 pb-48 bg-[url('/images/athlete-test-img-2.png')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-gradient-to-br from-nil-navy/85 via-nil-navy/50 to-nil-orange/45 z-0"></div>
          <div className="relative z-10 container-custom flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-40 mb-8 text-gray-100">
              NIL: <span className="heading-gradient-light">ALL YOU NEED TO KNOW</span>
            </h1>
          </div>
        </section>

        {/* New section with gradient background */}
        <section className="py-20 blotchy-gradient-nil">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">Understanding NIL</h2>
            <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg mb-8">
              This section will provide detailed information about Name, Image, and Likeness (NIL) rights for student-athletes. 
              We'll cover the rules, opportunities, and how NILHispanic can help you navigate this landscape.
            </p>
            {/* Placeholder content to make the section scrollable */}
            <div className="space-y-4 text-left max-w-2xl mx-auto text-nil-dark-gray">
              <p>Placeholder paragraph 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Placeholder paragraph 2: Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Placeholder paragraph 3: Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
              <p>Placeholder paragraph 4: Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
              <p>Placeholder paragraph 5: Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
              <p>Placeholder paragraph 6: Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
              <p>Placeholder paragraph 7: Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
              <p>Placeholder paragraph 8: At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
              <p>Placeholder paragraph 9: Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
              <p>Placeholder paragraph 10: Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WhatsNILPage;
