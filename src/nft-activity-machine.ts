import { assign, createMachine } from "xstate";

interface Context {
  selectedActivities: string[];
  sortBy: string;
  activity: {
    activityType: string;
    price: string;
    from: string;
    to: string;
    date: string;
  }[];
}
const mockFetchActivityResult = async (selectedActivities: string[]) => {
  const nList = [...Array(50).keys()];
  const activity =
    selectedActivities.length == 0
      ? []
      : nList.map(() => {
          return {
            activityType:
              selectedActivities[
                Math.floor(Math.random() * selectedActivities.length)
              ],
            price: `0.15 ETH`,
            from: `John Doe`,
            to: `Joe Dohn`,
            date: new Date().toString(),
          };
        });
  if (Math.floor(Math.random() * 100) < 10) throw "Forced fetch items ERROR";
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ activity });
    }, 500);
  }) as Promise<{
    activity: {
      activityType: string;
      price: string;
      from: string;
      to: string;
      date: string;
    }[];
  }>;
};

export const nftActivityMachine = createMachine(
  {
    tsTypes: {} as import("./nft-activity-machine.typegen").Typegen0,
    id: "ACTIVITY",
    schema: {
      context: {} as Context,
      events: {} as
        | { type: "ACTIVITY.RELOAD" }
        | { type: "ACTIVITY.TOGGLE"; activityType: string }
        | { type: "ACTIVITY.SORT_CHANGED"; sortBy: string },
      services: {} as {
        fetchActivity: {
          data: {
            activity: {
              activityType: string;
              price: string;
              from: string;
              to: string;
              date: string;
            }[];
          };
        };
      },
    },
    context: {
      selectedActivities: ["list", "minted", "sale", "transfer", "offers"],
      sortBy: "oldestFirst",
      activity: [],
    },
    states: {
      loading: {
        invoke: {
          id: "fetch-activity",
          src: "fetchActivity",
          onDone: {
            target: "display",
            actions: "updateActivity",
          },
          onError: { target: "failed" },
        },
      },
      display: {
        on: {
          "ACTIVITY.RELOAD": {
            target: "loading",
          },
          "ACTIVITY.TOGGLE": {
            target: "loading",
            actions: "updateSelectedActivities",
          },
          "ACTIVITY.SORT_CHANGED": {
            target: "loading",
            actions: "updateSortBy",
          },
        },
      },
      failed: {
        on: {
          "ACTIVITY.RELOAD": {
            target: "loading",
          },
        },
      },
    },
    initial: "loading",
  },
  {
    services: {
      fetchActivity: async (context) => {
        // const response = await fetch(`https://www.bgf.com/`);
        // const json = await response.json();
        const json = await mockFetchActivityResult(context.selectedActivities);
        return json;
      },
    },
    actions: {
      updateActivity: assign((context, event) => {
        return {
          ...context,
          activity: event.data.activity,
        };
      }),
      updateSortBy: assign((context, event) => {
        return {
          ...context,
          sortBy: event.sortBy,
        };
      }),
      updateSelectedActivities: assign((context, event) => {
        const index = context.selectedActivities.indexOf(event.activityType);
        if (index > -1) {
          context.selectedActivities.splice(index, 1);
        } else {
          context.selectedActivities.push(event.activityType);
        }
        return {
          ...context,
        };
      }),
    },
  }
);
