import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "inst-1",
        name: "Engr. Ibrahim Hambak",
        email: "hambak901@gmail.com",
        specialization: "Full-Stack Systems & Network Security",
        bio: "Senior Systems Engineer with over 10 years experience in enterprise IT and cloud deployments.",
        avatarUrl: "/images/team/team-01.png"
      },
      {
        id: "inst-2",
        name: "Maryam Bello",
        email: "maryam@hambaktech.com.ng",
        specialization: "Creative Branding, Print & UI/UX",
        bio: "Brand identity lead specializing in professional visual graphics and commercial offset printing.",
        avatarUrl: "/images/team/team-02.png"
      },
      {
        id: "inst-3",
        name: "Olanrewaju Davies",
        email: "davies@hambaktech.com.ng",
        specialization: "Data Analytics, SQL & BI Architecture",
        bio: "Business intelligence architect training analysts across commercial finance and technology.",
        avatarUrl: "/images/team/team-03.png"
      }
    ]
  });
}
