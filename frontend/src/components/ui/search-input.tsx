import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

export function SearchInput(props: InputProps) {
  return <Input type="search" leadingIcon={<Search />} {...props} />;
}
