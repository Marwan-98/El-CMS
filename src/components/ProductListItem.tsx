import { EXPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { ExportItem, ImportItem } from "@prisma/client";

export default function ProductListItem({
  item,
  certificateType,
}: {
  item: ImportItem | ExportItem;
  certificateType: string;
}) {
  if (certificateType === EXPORT_CERTIFICATE) {
    const { name, grossWeight, netWeight } = (item as ExportItem) || {};
    return (
      <tr className="h-12  bg-[#FCA311] text-white">
        <td>{name}</td>
        <td>{grossWeight}</td>
        <td>{netWeight}</td>
      </tr>
    );
  }

  const { incomingQuantity, mixingRatio, name, weightPerLinearMeter, width } = (item as ImportItem) || {};

  return (
    <tr className="h-12  bg-[#FCA311] text-white">
      <td>{name}</td>
      <td>{mixingRatio}</td>
      <td>{width}</td>
      <td>{weightPerLinearMeter}</td>
      <td>{incomingQuantity}</td>
      <td>{Math.floor(weightPerLinearMeter * incomingQuantity)}</td>
    </tr>
  );
}
