import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useLocation } from 'wouter';
import { ArrowRight01Icon, Logout01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useAuth } from '@/context/auth-context';
import { IconRenderer } from '@/lib/icons';

// Menu Configuration
export const menuGroups = [
  {
    label: 'Operations',
    items: [
      {
        title: 'Operations',
        icon: 'DeliveryBox01Icon',
        items: [
          { title: 'Orders/Waybills', url: '/ops/orders', badge: null },
          // { title: 'Trips', url: '/ops/trips', badge: 'M1' },
          // { title: 'AI Trip Planner', url: '/ops/ai-planner' },
          // { title: 'POD', url: '/ops/pod' },
        ],
      },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="h-16 flex flex-row items-center border-b border-sidebar-border/50 px-4 w-full group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 font-bold text-xl w-full">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
            <IconRenderer name="TruckIcon" className="size-5" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden truncate text-primary font-semibold">
            TMS
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                // If item has sub-items
                if (item.items && item.items.length > 0) {
                  // Standard Collapsible for Expanded State
                  if (state !== 'collapsed') {
                    return (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={false}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                              <IconRenderer name={item.icon} className="size-5" />
                              <span>{item.title}</span>
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location === subItem.url}
                                    className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                      {subItem.badge && (
                                        <span className="ml-auto text-xs font-mono bg-primary/10 text-primary px-1.5 rounded-sm">
                                          {subItem.badge}
                                        </span>
                                      )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  // Dropdown for Collapsed State
                  return (
                    <SidebarMenuItem key={item.title}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <IconRenderer name={item.icon} className="size-5" />
                            <span>{item.title}</span>
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                            />
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          className="min-w-56 rounded-lg bg-sidebar p-2 text-sidebar-foreground border-sidebar-border"
                        >
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            {item.title}
                          </DropdownMenuLabel>
                          {item.items.map((subItem) => (
                            <DropdownMenuItem
                              key={subItem.title}
                              asChild
                              className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                            >
                              <Link
                                href={subItem.url}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <span>{subItem.title}</span>
                                {subItem.badge && (
                                  <span className="ml-auto text-xs font-mono bg-primary/10 text-primary px-1.5 rounded-sm">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                // Standard item without sub-items
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      asChild
                    >
                      <Link href={item.items[0]?.url || '#'}>
                        <IconRenderer name={item.icon} className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent rounded-md p-2 transition-colors">
              <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <IconRenderer name="UserIcon" className="size-4" />
              </div>
              <div className="flex flex-col text-sm text-left group-data-[collapsible=icon]:hidden">
                <span className="font-semibold">{user?.username || 'User'}</span>
                <span className="text-xs text-muted-foreground">{user?.email || ''}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            className="min-w-56 rounded-lg bg-sidebar p-2 text-sidebar-foreground border-sidebar-border"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
            >
              <Link href="/account/profile" className="flex items-center gap-2 cursor-pointer">
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground text-red-600"
            >
              <HugeiconsIcon icon={Logout01Icon} className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
