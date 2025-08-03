const CustomButton = ({ id, label, selected, onClick }) => {
  return (
    <li onClick={() => onClick(id)}>
      <input
        type="radio"
        id={id}
        name="hosting"
        value={id}
        className="hidden peer"
        defaultChecked={selected === id}
        required
      />
      <label
        htmlFor={id}
        className="inline-flex items-center text-lg justify-between w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer 
        peer-checked:bg-green-500 peer-checked:text-black
        hover:text-gray-600 hover:bg-gray-300"
      >
        <div className="block w-full font-bold">{label}</div>
      </label>
    </li>
  );
};

export default CustomButton;
