import { getImageUrl } from "../../utils/image";
import type { HeroSlide as HeroSlideType } from "../../types/landingPage";

interface HeroSlideProps {
  slide: HeroSlideType;
  isActive: boolean;
}

export default function HeroSlide({
  slide,
  isActive,
}: HeroSlideProps) {
  const desktopImg = slide.image_url
    ? getImageUrl(slide.image_url)
    : null;

  const mobileImg = slide.mobile_image_url
    ? getImageUrl(slide.mobile_image_url)
    : desktopImg;

  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive
          ? "opacity-100 z-10 pointer-events-auto"
          : "opacity-0 z-0 pointer-events-none"
        }`}
      aria-hidden={!isActive}
    >
      <picture className="block w-full h-full">
        {mobileImg && mobileImg !== desktopImg && (
          <source
            media="(max-width: 767px)"
            srcSet={mobileImg}
          />
        )}

        <img
          src={desktopImg || "/images/hero/hero_jackfruit_products.png"}
          alt={
            slide.title ||
            "JACRAL"
          }
          className="block w-full h-full object-cover object-center"
          loading={
            slide.slide_number === 1
              ? "eager"
              : "lazy"
          }
          draggable={false}
        />
      </picture>
    </div>
  );
}