import { interpret } from "xstate";
import { nftActivityMachine } from "./nft-activity-machine";

describe('"fetchActivity" on "loading" state', () => {
  test('"onDone", do "updateActivity" and  go to "display"', (done) => {
    const expectedItems = {
      activity: [
        {
          activityType: "list",
          price: `0.15 ETH`,
          from: `John Doe`,
          to: `Joe Dohn`,
          date: new Date().toString(),
        },
      ],
    };
    const mockFetchMachine = nftActivityMachine.withConfig({
      services: {
        fetchActivity: async (_, event) => expectedItems,
      },
    });
    interpret(mockFetchMachine)
      .onTransition((state) => {
        if (state.matches("display")) {
          try {
            expect(state.context.activity).toBe(expectedItems.activity);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });

  test('"onError", go to "failed"', (done) => {
    const mockFetchMachine = nftActivityMachine.withConfig({
      services: {
        fetchActivity: async (_, event) => {
          throw "This is a forced error!";
        },
      },
    });
    interpret(mockFetchMachine)
      .onTransition((state) => {
        if (state.matches("failed")) {
          try {
            expect(state.context.activity.length).toBe(0);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });
});

describe('"ACTIVITY.TOGGLE" event will change state from "display" to "loading"', () => {
  it("activity in selectedActivities, it will be removed", () => {
    const expectedState = "loading";
    nftActivityMachine.context.selectedActivities = [
      "list",
      "minted",
      "sale",
      "transfer",
      "offers",
    ];
    const actualState = nftActivityMachine.transition("display", {
      type: "ACTIVITY.TOGGLE",
      activityType: "offers",
    });

    expect(actualState.matches(expectedState)).toBeTruthy();
    expect(actualState.context.selectedActivities.indexOf("offers")).toBe(-1);
  });

  it("activity not in selectedActivities, it will be added", () => {
    const expectedState = "loading";
    nftActivityMachine.context.selectedActivities = ["list"];
    const actualState = nftActivityMachine.transition("display", {
      type: "ACTIVITY.TOGGLE",
      activityType: "offers",
    });

    expect(actualState.matches(expectedState)).toBeTruthy();
    expect(actualState.context.selectedActivities.indexOf("offers")).not.toBe(
      -1
    );
  });
});

it('should reach "loading" given "display" when the "ACTIVITY.SORT_CHANGED" event occurs', () => {
  const expectedState = "loading";

  const actualState = nftActivityMachine.transition("display", {
    type: "ACTIVITY.SORT_CHANGED",
    sortBy: "latestFirst",
  });

  expect(actualState.matches(expectedState)).toBeTruthy();
  expect(actualState.context.sortBy).toBe("latestFirst");
});

it('should reach "loading" given "display" when the "ACTIVITY.RELOAD" event occurs', () => {
  const expectedState = "loading";

  const actualState = nftActivityMachine.transition("display", {
    type: "ACTIVITY.RELOAD",
  });

  expect(actualState.matches(expectedState)).toBeTruthy();
});

it('should reach "loading" given "failed" when the "ACTIVITY.RELOAD" event occurs', () => {
  const expectedState = "loading";

  const actualState = nftActivityMachine.transition("failed", {
    type: "ACTIVITY.RELOAD",
  });

  expect(actualState.matches(expectedState)).toBeTruthy();
});
