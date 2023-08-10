'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell, Avatar, Burger, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconStar } from '@tabler/icons-react';
import classNames from 'classnames';
import { APP_NAME, ROUTES } from '~/modules/Config';

type NavigationElementsType = {
  label: string;
  href: string;
  disabled?: boolean;
};
const navigationElements: NavigationElementsType[] = [
  {
    label: 'Home',
    href: ROUTES.HOME,
  },
  {
    label: 'Example',
    href: ROUTES.EXAMPLE,
  },
];

const NAVBAR_HEIGHT = 60;
const SIDEBAR_WIDTH = 250;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <AppShell
        layout="alt"
        header={{
          height: NAVBAR_HEIGHT,
        }}
        // navbar={{
        //   width: SIDEBAR_WIDTH,
        //   breakpoint: 'sm',
        //   collapsed: { mobile: !opened },
        // }}
        padding="md"
      >
        <AppShell.Header>
          <div className="flex h-full items-center px-4">
            <div>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                className="mr-4"
              />
            </div>
            <div className="flex items-center gap-4">
              <Avatar
                color="blue"
                radius="sm"
                component={Link}
                href={ROUTES.HOME}
              >
                <IconStar size="1.5rem" />
              </Avatar>

              <Text className="text-xl" component={Link} href={ROUTES.HOME}>
                {APP_NAME}
              </Text>
            </div>
          </div>
        </AppShell.Header>

        {/*<AppShell.Navbar p="md">*/}
        {/*  <div className="flex h-full w-full flex-col">*/}
        {/*    <div>*/}
        {/*      <Burger*/}
        {/*        opened={opened}*/}
        {/*        onClick={toggle}*/}
        {/*        hiddenFrom="sm"*/}
        {/*        size="sm"*/}
        {/*        className="mb-4"*/}
        {/*      />*/}
        {/*    </div>*/}

        {/*    <div className="flex w-full flex-col gap-4">*/}
        {/*      {navigationElements.map((el) => {*/}
        {/*        if (el.disabled) {*/}
        {/*          return null;*/}
        {/*        }*/}
        {/*        return (*/}
        {/*          <Button*/}
        {/*            key={el.href}*/}
        {/*            variant="outline"*/}
        {/*            component={Link}*/}
        {/*            href={el.href}*/}
        {/*            className="w-full"*/}
        {/*          >*/}
        {/*            {el.label}*/}
        {/*          </Button>*/}
        {/*        );*/}
        {/*      })}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</AppShell.Navbar>*/}

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
};

export default Layout;
