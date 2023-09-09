import { Icon, IconButton, Indicator } from "@elpassion/taco";
import { IPipeline } from "./contracts";
import { Link } from "@remix-run/react";

interface PipelinesListItemProps {
  pipeline: IPipeline;
}
export const PipelinesListItem = ({ pipeline }: PipelinesListItemProps) => {
  return (
    <article className="bg-white px-6 py-4">
      <header className="flex items-center text-neutral-700">
        <div className="flex flex-grow">
          <Link
            to={`${pipeline.id}`}
            className="text-lg font-semibold hover:underline"
          >
            {pipeline.name}
          </Link>
        </div>
        <div className="flex items-center gap-12">
          <div>
            <p className="text-sm">$2.45</p>
          </div>
          <div>
            <p className="text-sm">113 runs</p>
          </div>
          <div>
            <Indicator variant="badge" type="success" text="Active" />
          </div>
        </div>
      </header>

      <div className="mb-3" />

      <div className="flex justify-between">
        <div className="flex gap-6">
          <div className="flex gap-2">
            <Icon iconName="zap" size="xs" />
            <p className="text-xs">Zapier API</p>
          </div>
          <div className="flex gap-2">
            <Icon iconName="arrow-right" size="xs" />
            <p className="text-xs">Sequence</p>
          </div>
        </div>
        <div>
          <IconButton
            ariaLabel=""
            icon={<Icon iconName="x" />}
            onClick={function noRefCheck() {
              // mutate(pipeline.id);
            }}
            size="xs"
            variant="outlined"
            title={`Remove workflow: ${pipeline.name}`}
          />
        </div>
      </div>
    </article>
  );
};

// interface PipelinesListProps {
//   initialData?: { data: TPipeline[] };
// }
// export const PipelinesListItem = ({ initialData }: PipelinesListProps) => {
//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-8 text-xs font-medium">
//           <div className="flex items-center justify-center gap-2">
//             <p>Usage</p>
//             {/* TODO (hub33k): find sort icon */}
//             <Icon
//               iconName="bar-chart"
//               size="sm"
//               className="-rotate-90 transform-gpu text-neutral-500"
//             />
//           </div>
//
//           <div className="flex items-center justify-center gap-2">
//             <p>Monthly</p>
//             <Icon
//               iconName="chevron-down"
//               size="sm"
//               className="flex items-center justify-center"
//             />
//           </div>
//         </div>
//       </div>
//
//       <div className="mb-2" />
//       {pipelines.map((pipeline) => {
//         return (
//           <div key={pipeline.id} className="bg-white px-6 py-4">
//
//           </div>
//         );
//       })}
//     </div>
//   );
// };
