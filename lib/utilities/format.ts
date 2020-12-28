function TimeFormatter(time: number) {
  return [
    Math.floor(time / 3600),
    Math.floor((time % 3600) / 60),
    Math.floor((time % 3600) % 60),
  ];
}

TimeFormatter.reduce = (acc: string, value: number) => {
  if (acc.length === 0) {
    return value.toString();
  } else {
    return `${acc}:${value.toString().padStart(2, "0")}`;
  }
};

export function Time(seconds: number) {
  if (isNaN(seconds)) {
    return "0:00";
  }

  const time = TimeFormatter(seconds);
  const result = time
    .slice(time.findIndex((value) => value !== 0))
    .reduce(TimeFormatter.reduce, "");
  if (result.length < 3) {
    return `0:${result.padStart(2, "0")}`;
  } else {
    return result;
  }
}

function AgeFormatter(then: Date) {
  const now = new Date();
  const entries = Object.entries({
    year: now.getFullYear() - then.getFullYear(),
    month: now.getMonth() - then.getMonth(),
    day: now.getDate() - then.getDate(),
    hour: now.getHours() - then.getHours(),
    minute: now.getMinutes() - then.getMinutes(),
    second: now.getSeconds() - then.getSeconds(),
  });
  return entries[entries.findIndex((entry) => entry[1] !== 0)];
}

AgeFormatter.value = (entry: [string, number]) => Math.abs(entry[1]);

AgeFormatter.unit = (entry: [string, number]) =>
  Math.abs(entry[1]) === 1 ? entry[0] : `${entry[0]}s`;

AgeFormatter.suffix = (entry: [string, number]) =>
  entry[1] < 0 ? "from now" : "ago";

export function Age(date: Date) {
  const age = AgeFormatter(date);
  if (typeof age === "undefined") return undefined;
  return [
    AgeFormatter.value(age),
    AgeFormatter.unit(age),
    AgeFormatter.suffix(age),
  ].join(" ");
}

function ValueFormatter(value: number) {
  const entries = Object.entries({
    Q: value / 1e15,
    T: value / 1e12,
    B: value / 1e9,
    M: value / 1e6,
    K: value / 1e3,
    "": Math.floor(value),
  }).map((entry) => [entry[0], ValueFormatter.round(entry[1])]);
  return entries[entries.findIndex((entry) => (entry[0] ? !!entry[1] : true))];
}

ValueFormatter.round = (value: number) => {
  if (value >= 1000) {
    return undefined;
  } else if (value >= 100) {
    return +value.toPrecision(3);
  } else if (value >= 1) {
    return +value.toPrecision(2);
  } else {
    return 0;
  }
};

export function Value(num: number, unit?: string) {
  const value = ValueFormatter(num);
  if (typeof value[1] === "undefined") return undefined;
  const suffix = !value[0] && value[1] === 1 ? unit : `${unit}s`;
  const result = value?.reverse().join("");
  return unit ? `${result} ${suffix}` : result;
}
