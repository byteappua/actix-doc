import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Actix Doc
        </h1>
        <p className="text-muted-foreground">
          Select a document from the sidebar or create a new one.
        </p>
      </div>
      <Button>Create Document</Button>
    </div>
  );
}
