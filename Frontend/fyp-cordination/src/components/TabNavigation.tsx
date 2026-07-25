import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tab {
  value: string;
  label: string;
}

interface TabNavigationProps {
  defaultValue: string;
  tabs: Tab[];
  onValueChange?: (value: string) => void;
}

const TabNavigation = ({
  defaultValue,
  tabs,
  onValueChange,
}: TabNavigationProps) => (
  <Tabs
    className="w-full max-w-md"
    defaultValue={defaultValue}
    onValueChange={onValueChange}
  >
    <TabsList className="grid w-full grid-cols-3">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value}>
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default TabNavigation;
