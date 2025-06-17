import { Button, ButtonGroup, ButtonText, Link } from "@/ui/components";
import { useLink, usePathname } from "solito/navigation";

export const LangSwitch = () => {
  const pathname = usePathname();
  const pathWithoutLang = pathname?.slice(3);

  const ukLanguageLinkProps = useLink({
    href: "/uk" + pathWithoutLang,
  });

  const enLanguageLinkProps = useLink({
    href: "/en" + pathWithoutLang,
  });

  return (
    <ButtonGroup className="flex-row">
      <Link {...ukLanguageLinkProps}>
        <Button size="xs">
          <ButtonText>🇺🇦 uk</ButtonText>
        </Button>
      </Link>
      <Link {...enLanguageLinkProps}>
        <Button size="xs">
          <ButtonText>🇬🇧 en</ButtonText>
        </Button>
      </Link>
    </ButtonGroup>
  );
};
