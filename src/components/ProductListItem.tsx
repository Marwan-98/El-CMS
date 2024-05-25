import { EXPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { ExportProduct, ImportProduct } from "@/lib/types";

export default function ProductListItem({
  item,
  certificateType,
}: {
  item: ImportProduct | ExportProduct;
  certificateType: string;
}) {
  if (certificateType === EXPORT_CERTIFICATE) {
    const { name, grossWeight, netWeight } = (item as ExportProduct) || {};
    return (
      <tr className="h-12">
        <td>{name}</td>
        <td>{grossWeight}</td>
        <td>{netWeight}</td>
      </tr>
    );
  }

  const { incomingQuantity, mixingRatio, name, weightPerLinearMeter, width } =
    (item as ImportProduct) || {};

  return (
    <tr className="h-12">
      <td>{name}</td>
      <td>{mixingRatio}</td>
      <td>{width}</td>
      <td>{weightPerLinearMeter}</td>
      <td>{incomingQuantity}</td>
      <td>{Math.floor(weightPerLinearMeter * incomingQuantity)}</td>
    </tr>
  );
}
