// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { BarChart3 } from "lucide-react";

// interface Competitor {
//   name: string;
//   marketShare: string;
//   growthRate: string;
//   strengths: string;
//   weaknesses: string;
// }

// interface CompetitorAnalysisProps {
//   competitorData: Competitor[];
// }

// export const CompetitorAnalysis = ({ competitorData }: CompetitorAnalysisProps) => {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <BarChart3 className="h-5 w-5 text-blue-600" /> Competitor Analysis
//         </CardTitle>
//         <CardDescription>Detailed analysis of key market competitors</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Competitor</TableHead>
//               <TableHead>Market Share</TableHead>
//               <TableHead>Growth</TableHead>
//               <TableHead>Strengths</TableHead>
//               <TableHead>Weaknesses</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {competitorData.map((competitor, index) => (
//               <TableRow key={index}>
//                 <TableCell className="font-medium">{competitor.name}</TableCell>
//                 <TableCell>{competitor.marketShare}</TableCell>
//                 <TableCell className="text-green-600">{competitor.growthRate}</TableCell>
//                 <TableCell>{competitor.strengths}</TableCell>
//                 <TableCell>{competitor.weaknesses}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// };


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3 } from "lucide-react";

interface Market {
  name: string;
  score: string;
  size: string;
  competition: string;
  barriers: string;
  details: {
    summary: string;
    subMarkets: Array<{
      name: string;
      size: string;
      growth: string;
    }>;
    keyInsights: string[];
    recommendedActions: string[];
  };
}

interface CompetitorAnalysisProps {
  competitorData: Market[];
}

export const CompetitorAnalysis = ({ competitorData }: CompetitorAnalysisProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" /> Competitor Analysis
        </CardTitle>
        <CardDescription>Detailed analysis of key markets and opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Market</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Market Size</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Barriers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitorData.map((market, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{market.name}</TableCell>
                <TableCell>{market.score}</TableCell>
                <TableCell>{market.size}</TableCell>
                <TableCell className="text-blue-600">{market.competition}</TableCell>
                <TableCell>{market.barriers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
