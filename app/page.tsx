import { SkillTree } from "@/components/skill-tree";
import { DynamicBackground } from "@/components/dynamic-background";
import {
  connections,
  progressionTiers,
  skillPaths,
  skills,
  skillTreeMeta,
} from "@/data/skills";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <DynamicBackground />
      <div className="relative z-10">
        <SkillTree
          initialSkills={skills}
          connections={connections}
          title={skillTreeMeta.name}
          description={skillTreeMeta.description}
          targetScore={skillTreeMeta.targetScore}
          maxLevel={skillTreeMeta.maxLevel}
          skillPaths={skillPaths}
          progressionTiers={progressionTiers}
        />
      </div>
    </main>
  );
}
