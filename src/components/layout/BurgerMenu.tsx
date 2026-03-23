"use client";
import { Typography, IconButton, Paper } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useState } from "react";
import { MainMenu } from "./MainMenu";

interface BurgerMenuProps {
  flat?: boolean;
  /** Renders without any position wrapper — for inline use inside a parent container */
  inline?: boolean;
  toQueryString?: () => string;
  toListQueryString?: () => string;
}

export const BurgerMenu = ({
  flat = false,
  inline = false,
  toQueryString,
  toListQueryString,
}: BurgerMenuProps) => {
  const [open, setOpen] = useState(false);

  const button = (
    <IconButton
      onClick={() => setOpen(true)}
      sx={{ color: "text.primary" }}
      aria-label="Open menu"
    >
      <MenuIcon />
      <Typography variant="h5" sx={{ ml: 0.5 }}>
        HM
      </Typography>
    </IconButton>
  );

  return (
    <>
      {inline ? (
        button
      ) : flat ? (
        <div style={{ position: "fixed", top: 16, left: 16, zIndex: 1200 }}>
          {button}
        </div>
      ) : (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1200,
            borderRadius: 2,
          }}
        >
          {button}
        </Paper>
      )}
      <MainMenu
        open={open}
        onClose={() => setOpen(false)}
        toQueryString={toQueryString}
        toListQueryString={toListQueryString}
      />
    </>
  );
};

export default BurgerMenu;
