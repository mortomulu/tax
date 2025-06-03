import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";
import dayjs from "dayjs";

const jobMap: Record<string, () => Promise<void>> = {
  "archieve-tax": async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/archieve-tax`, {
      method: "POST",
    });
  },
  "set-dec-tax": async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/set-dec-tax`, {
      method: "POST",
    });
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data: jobs, error } = await supabase
    .from("cron_jobs")
    .select("*")
    .eq("is_active", true);

  if (error || !jobs) {
    return res.status(500).json({ message: "Failed to fetch cron jobs", error });
  }

  const now = dayjs();
  const executedJobs = [];

  for (const job of jobs) {
    try {
      const jobDate = dayjs(job.execution_date);
      const isDue = jobDate.isSame(now, 'day');

      if (isDue) {
        const task = jobMap[job.script_name];
        if (task) {
          await task();
          executedJobs.push(job.name);
          
          if (job.schedule_type === 'one-time') {
            await supabase
              .from("cron_jobs")
              .update({ is_active: false })
              .eq("id", job.id);
          }
        }
      }
    } catch (err) {
      console.error(`Error processing job ${job.name}:`, err);
    }
  }

  res.status(200).json({ 
    message: "Cron jobs executed",
    executedJobs,
    timestamp: now.format('YYYY-MM-DD HH:mm:ss')
  });
}