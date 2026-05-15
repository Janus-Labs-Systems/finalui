import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);
const card = ({ n = 4 }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
      {Array.from({ length: n }, (_, index) => (
        <Card key={index} style={{ minWidth: 40 }}>
          <CardContent className="-colorcard">
            <Typography
              gutterBottom
              sx={{ color: "text.secondary", fontSize: 14 }}
            >
              Notification {index + 1}
            </Typography>
            <Typography variant="h5" component="div">
              Locker out of service
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
              ADV002
            </Typography>
            <Typography variant="body2">
              Critical Impact
              <br />
              {'"The Manager is advised to check support"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};
// const card = ({ n = 5 }) => {
//   <React.Fragment>
//     <CardContent className="card-color">
//       <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
//         Notifications
//       </Typography>
//       <Typography variant="h5" component="div">
//         Locker out of service
//       </Typography>
//       <Typography sx={{ color: "text.secondary", mb: 1.5 }}>ADV002</Typography>
//       <Typography variant="body2">
//         Crtical Impact
//         <br />
//         {'"The Manager is adviced to check support"'}
//       </Typography>
//     </CardContent>
//     <CardActions>
//       <Button size="small">Learn More</Button>
//     </CardActions>
//   </React.Fragment>;
//   return (
//     <div>
//       {" "}
//       {Array.from({ length: n }, (_, index) => (
//         <div key={index} style={{ marginBottom: "20px" }}>
//           {" "}
//           <Card>
//             <h3>Notification {index + 1}</h3>{" "}
//           </Card>
//         </div>
//       ))}{" "}
//     </div>
//   );
// };

export default function OutlinedCard() {
  return (
    <Box sx={{ minWidth: 1800 }}>
      <Card variant="outlined">{card({})}</Card>
    </Box>
  );
}
