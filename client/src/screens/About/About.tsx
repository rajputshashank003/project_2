import React from "react";
import { useAbout } from "./useAbout";
import { AboutContext } from "./context";
import { useApp } from "../../context/AppContext";
import { Heart, Users, Target, UserCircle2 } from "lucide-react";

const TeamSection: React.FC = () => {
    const ctx = React.useContext(AboutContext);
    if (!ctx) return null;
    const { teamMembers, isLoading } = ctx;

    return (
        <section className="mt-16">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    <Users className="h-3.5 w-3.5" />
                    Leadership
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Meet Our Team
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                    The dedicated people driving our mission forward, one
                    initiative at a time.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                </div>
            ) : (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-4xl mx-auto">
                    {teamMembers.map((member) => (
                        <div
                            key={member.slot}
                            className="flex flex-col items-center text-center w-28 sm:w-36"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-card-md mb-3 bg-slate-100 flex items-center justify-center">
                                {member.photoUrl ? (
                                    <img
                                        src={member.photoUrl}
                                        alt={
                                            member.name ||
                                            `Team member ${member.slot}`
                                        }
                                        className="w-full h-full object-cover "
                                    />
                                ) : (
                                    <UserCircle2
                                        className="h-16 w-16 text-slate-300"
                                        strokeWidth={1}
                                    />
                                )}
                            </div>
                            <div className="min-h-[2.5rem] flex flex-col items-center justify-center">
                                {member.name ? (
                                    <React.Fragment>
                                        <p className="font-semibold text-slate-900 text-sm leading-snug">
                                            {member.name}
                                        </p>
                                        {member.designation && (
                                            <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                                {member.designation}
                                            </p>
                                        )}
                                    </React.Fragment>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">
                                        Not yet assigned
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

const AboutSkeleton: React.FC = () => (
    <div className="page-wrapper animate-pulse space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="h-6 w-24 bg-slate-200 rounded-full mx-auto" />
            <div className="h-9 w-64 bg-slate-200 rounded-xl mx-auto" />
            <div className="h-4 w-96 max-w-full bg-slate-200 rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card-md space-y-3 h-48 bg-slate-100/80 rounded-2xl p-6" />
            <div className="card-md space-y-3 h-48 bg-slate-100/80 rounded-2xl p-6" />
        </div>

        <div className="h-44 rounded-2xl bg-slate-200" />

        <div className="space-y-6 pt-4">
            <div className="h-7 w-40 bg-slate-200 rounded-xl mx-auto" />
            <div className="flex justify-center gap-8">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center space-y-2"
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-200" />
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AboutContent: React.FC = () => {
    const { ngoConfig, isConfigLoading } = useApp();
    const ctx = React.useContext(AboutContext);
    const isLoading = ctx?.isLoading || isConfigLoading;

    if (isLoading) {
        return <AboutSkeleton />;
    }

    return (
        <div className="page-wrapper">
            {/* Hero */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    <Heart className="h-3.5 w-3.5" />
                    About Us
                </div>
                <h1 className="section-heading mb-3">
                    {ngoConfig.name || "About Our NGO"}
                </h1>
                <p className="section-subheading max-w-2xl mx-auto text-base">
                    {ngoConfig.tagline ||
                        "We are committed to empowering communities and creating sustainable change through compassion, education, and action."}
                </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="card-md">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                        <Target className="h-5 w-5 text-emerald-700" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mb-2">
                        Our Mission
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {ngoConfig.mission ||
                            "To provide resources, support, and opportunities that uplift underserved communities, helping individuals lead dignified, self-sufficient lives through targeted programs and partnerships."}
                    </p>
                </div>
                <div className="card-md">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                        <Heart className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mb-2">
                        Our Vision
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {ngoConfig.vision ||
                            "A world where every individual has access to basic needs, quality education, and equal opportunities — where communities thrive through compassion and collective action."}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-8 text-white mb-12">
                <h2 className="text-lg font-bold text-center mb-8 text-emerald-100">
                    Our Impact So Far
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                    {[
                        {
                            label: "Beneficiaries",
                            value: ngoConfig.statBeneficiaries || "10,000+",
                        },
                        {
                            label: "Volunteers",
                            value: ngoConfig.statVolunteers || "500+",
                        },
                        {
                            label: "Events Held",
                            value: ngoConfig.statEventsHeld || "120+",
                        },
                        {
                            label: "Years Active",
                            value:
                                ngoConfig.statYearsActive ||
                                `${new Date().getFullYear() - (ngoConfig.foundedYear || 2020)}+`,
                        },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-3xl font-extrabold mb-1">
                                {stat.value}
                            </div>
                            <div className="text-emerald-200 text-sm font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Section */}
            <TeamSection />
        </div>
    );
};

const About: React.FC = () => {
    const state = useAbout();
    return (
        <AboutContext.Provider value={state}>
            <AboutContent />
        </AboutContext.Provider>
    );
};

export default About;
