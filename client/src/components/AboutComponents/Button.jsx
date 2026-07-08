import clsx from "clsx";
import { Link } from "react-router-dom";

const Button = ({ id, title, rightIcon, leftIcon, containerClass, to, onClick }) => {
  const className = clsx(
    "group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-[#d9d9d9] px-7 py-3 text-[#000000]",
    containerClass
  );

  const content = (
    <>
      {leftIcon}

      <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
        <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
          {title}
        </div>
        <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
          {title}
        </div>
      </span>

      {rightIcon}
    </>
  );

  if (to) {
    return (
      <Link id={id} className={className} to={to} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button id={id} className={className} onClick={onClick}>
      {content}
    </button>
  );
};

export default Button;