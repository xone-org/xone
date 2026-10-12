import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletAccount } from "@/hooks/use-wallet-account";
import { shortAddress } from "@/lib/address";

/**
 * Compact account chip linking to settings.
 */
export function AccountMenu() {
  const { address } = useWalletAccount();
  const { t } = useI18n();

  if (!address) return null;

  return (
    <Button variant="outline" size="sm" asChild>
      <Link to="/app/settings" className="font-mono" aria-label={t("layout.account")}>
        <User className="h-3.5 w-3.5" aria-hidden />
        {shortAddress(address)}
      </Link>
    </Button>
  );
}
