import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface FailureData {
  name: string;
  value: number;
  color: string;
}

const FAILURE_DATA: FailureData[] = [
  { name: "IMPORT", value: 4, color: "hsl(173, 80%, 50%)" },
  { name: "SYNTAX", value: 3, color: "hsl(0, 72%, 55%)" },
  { name: "TYPE", value: 5, color: "hsl(38, 92%, 50%)" },
  { name: "DEPENDENCY", value: 2, color: "hsl(142, 71%, 45%)" },
  { name: "LOGIC", value: 3, color: "hsl(262, 80%, 60%)" },
  { name: "CONFIG", value: 1, color: "hsl(200, 70%, 50%)" },
];

const FailureChart = ({ data = FAILURE_DATA }: { data?: FailureData[] }) => {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Failure Classification
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(222, 47%, 9%)",
                  border: "1px solid hsl(222, 30%, 16%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 40%, 96%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5">
          {data.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="text-foreground font-mono font-semibold">{d.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FailureChart;
