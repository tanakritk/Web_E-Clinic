import { ReactNode } from "react";

interface CardCustomProps {
  children: ReactNode;
  className?: string;
}

const CardCustom = ({ children, className }: CardCustomProps) => {
  return (
    <div className={`py-3 px-3 rounded-3xl bg-white shadow ${className}`}>
      {/* <div className="md:h-16 bg-primary rounded-t-lg items-center flex px-3">
        <span className="text-white  text-lg">
          {title}
        </span>
      </div> */}
      <div className="">{children}</div>
    </div>
  );
};

export default CardCustom;
