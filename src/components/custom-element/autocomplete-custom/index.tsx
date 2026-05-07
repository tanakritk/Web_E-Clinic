// import { Autocomplete, TextField } from "@mui/material";

// interface OptionProps {
//   label: string;
//   value: string;
// }

// interface AutocompleteCustomProps {
//   option: OptionProps[];
//   value: string;
//   onChange: (files: any) => void;
//   multiple?: boolean
// }

// const AutocompleteCustom = ({option, value, onChange, multiple=false}: AutocompleteCustomProps) => {

//     const onChangeData = (event: any, newValue: any) => {
//         console.log(event);
//         return onChange(newValue?.value)
//     }
//   return (
//     <>
//       <Autocomplete
//         multiple={multiple}
//         value={option.find((item) => item.value === value) || null}
//         onChange={onChangeData}
//         options={option}
//         getOptionLabel={(option) => option.label}
//         renderInput={(params) => <TextField className="bg-white" {...params} />}
//       />
//     </>
//   );
// };

// export default AutocompleteCustom;

import { Autocomplete, TextField } from "@mui/material";

interface OptionProps {
  label: string;
  value: string;
}

interface AutocompleteCustomProps {
  option: OptionProps[];
  value: string | string[] | number | number[];
  onChange: (name: string, value: string | string[]) => void;
  multiple?: boolean;
  name: string;
  size?: "small" | "medium";
}

const AutocompleteCustom = ({
  option,
  value,
  onChange,
  multiple = false,
  name,
  size = "medium",
}: AutocompleteCustomProps) => {
  const onChangeData = (
    _: unknown,
    newValue: OptionProps | OptionProps[] | null,
  ) => {
    if (multiple) {
      // ถ้า multiple ให้ return เป็น string[]
      const selectedValues = (newValue as OptionProps[]).map(
        (item) => item.value,
      );
      onChange(name, selectedValues);
    } else {
      // ถ้า single ให้ return เป็น string
      onChange(name, (newValue as OptionProps | null)?.value || "");
    }
  };

  return (
    <Autocomplete
      size={size}
      multiple={multiple}
      value={
        multiple
          ? option.filter((item) => (value as string[]).includes(item.value)) // multiple: array
          : option.find((item) => item.value === value) || null // single: object
      }
      onChange={onChangeData}
      options={option}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          className="bg-white"
          {...params}
          sx={{
            "& .MuiOutlinedInput-root": {
              paddingTop: "0px !important",
              paddingBottom: "0px !important",
            },
            "& .MuiAutocomplete-input": {
              padding: "16px 16px 16px 12px !important",
            },
          }}
        />
      )}
    />
  );
};

export default AutocompleteCustom;
