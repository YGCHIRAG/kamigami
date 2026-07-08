import React from "react";
import { Star } from "lucide-react";
import "./module.css"

const ReviewsSection = () => {

  const ratingBars = [
    { star: 5, width: "85%" },
    { star: 4, width: "70%" },
    { star: 3, width: "60%" },
    { star: 2, width: "45%" },
    { star: 1, width: "30%" }
  ];

  return (
    <section className="bg-black text-white py-20 px-6 lg:px-12">

      <div className="max-w-[1400px] mx-auto">

        {/* Title */}

        <h2 className="review text-xl text-[#d4c9a8] mb-12">
          Reviews & Ratings
        </h2>


        <div className="grid lg:grid-cols-3 gap-10 items-center">


          {/* LEFT BIG RATING */}

          <div className="flex items-center gap-3">

            <h1 className="rating-percent text-[120px] lg:text-[150px] font-bold text-red-700 leading-none">
              4.5
            </h1>

            <span className="rating-percent text-3xl text-white">
              /5
            </span>

          </div>



          {/* RATING BARS */}

          <div className="space-y-4">

            {ratingBars.map((item, i) => (

              <div key={i} className="flex items-center gap-3">

                <div className="flex items-center gap-1 text-yellow-400 w-10">

                  <Star size={14} fill="currentColor"/>
                  <span className="rating-percent text-sm">{item.star}</span>

                </div>

                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: item.width }}
                  ></div>

                </div>

              </div>

            ))}

          </div>



          {/* REVIEW CARD */}

          <div className="bg-[#0d0d0d] rounded-xl p-6 border border-neutral-800">

            <div className="flex items-start gap-4">

              <img 
                src="https://tse3.mm.bing.net/th/id/OIP.q9P9v3T1TcUkYWh7lYGzlwHaHa?pid=Api&P=0&h=180"
                alt="user"
                className="w-14 h-14 rounded-full object-cover"
              />

              <div className="flex-1">

                <div className="flex justify-between items-center">

                  <h3 className="testimonial-user font-semibold text-lg">
                    Modi Modi
                  </h3>

                  <span className="review-date text-xs text-gray-400">
                    13 OCT 2025
                  </span>

                </div>

                <div className="flex text-yellow-400 mt-1 mb-2">

                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}

                </div>

                <p className="review-text text-gray-400 text-sm leading-relaxed">
                  Angena gātram, nayena vakratam, jñānena rājyam,
                  lavanena bhojyam.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* YOU MIGHT ALSO LIKE */}

        <h2 className="text-center text-red-600 text-4xl lg:text-5xl font-bold mt-24">
          You might also like
        </h2>

      </div>

    </section>
  );
};

export default ReviewsSection;
