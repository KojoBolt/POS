import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Barcode from 'react-barcode';


const Receipt = ({ order, onAfterPrint }) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,  
    onAfterPrint,
  });

  return (
    <div>
      <button
        onClick={handlePrint}
        className="bg-black text-white px-4 py-2 rounded mb-4"
      >
        Print Receipt
      </button>

      <div
        ref={componentRef}
  className="w-[300px] mx-auto bg-white text-black font-mono text-sm p-4 border border-gray-300 printable-receipt"
      >
        <div className="text-center mb-2">
          <h2 className="font-bold">Sauber</h2>
          <p>Address: Accra Ghana, 23-10</p>
          <p>Email: sauber@gmail.com</p>
        </div>

        {/* Vehicle Info */}
        {(order?.vehicleMake || order?.vehicleModel || order?.vehicleYear || order?.vehiclePlate) && (
          <div className="mb-2 text-xs">
            <div><span className="font-semibold">Vehicle:</span></div>
            <div>Make: {order?.vehicleMake || '-'}</div>
            <div>Model: {order?.vehicleModel || '-'}</div>
            <div>Year: {order?.vehicleYear || '-'}</div>
            <div>Plate: {order?.vehiclePlate || '-'}</div>
          </div>
        )}

        <p className="text-center font-bold my-2">CASH RECEIPT</p>
        <p className="border-t border-dashed my-2"></p>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Description</th>
              <th className="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {order?.services?.map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td className="text-right">{item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="border-t border-dashed my-2"></p>

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{order?.total?.toFixed(2) ?? "0.00"}</span>
        </div>
        <div className="flex justify-between">
          <span>Cash</span>
          <span>{order?.cash?.toFixed(2) ?? order?.total?.toFixed(2) ?? "0.00"}</span>
        </div>
        <div className="flex justify-between">
          <span>Change</span>
          <span>
            {order?.cash && order?.total
              ? (order.cash - order.total).toFixed(2)
              : "0.00"}
          </span>
        </div>

        <p className="border-t border-dashed my-2"></p>

        <div className="text-center">
          <p>Bank Transfer Ref: {order?.ref || "N/A"}</p>
        </div>


        {/* Operator Info (Cashier or Admin) */}
        {order?.operatorRole && order?.operatorName && (
          <div className="mt-4 text-xs flex justify-between">
            <span>{order.operatorRole.charAt(0).toUpperCase() + order.operatorRole.slice(1)}:</span>
            <span>{order.operatorName}</span>
          </div>
        )}

        <Barcode className="mx-auto" value="Sauber" />
        <p className="text-center mt-2">THANK YOU!</p>
      </div>
    </div>
  );
};

export default Receipt;
