import React, { ReactNode } from "react";

type LayoutTwoColumnsProps = {
  left: ReactNode;
  right: ReactNode;
};

const LayoutTwoColumns: React.FC<LayoutTwoColumnsProps> = ({ left, right }) => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row gap-6 p-6 bg-[var(--background)]">
      {/* Colonna sinistra - Dati */}
      <div className="w-full md:w-2/5 flex flex-col gap-6">
        {left}
      </div>
      {/* Colonna destra - Grafico */}
      <div className="w-full md:w-3/5 flex flex-col gap-6 sticky top-0">
        {right}
      </div>
    </div>
  );
};

export default LayoutTwoColumns;