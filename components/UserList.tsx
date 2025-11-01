import Image from "next/image";
import { useEffect, useState } from "react";

interface User{
    id: string
    name:string
    email: string
    image?: string
}

interface UserlistProps{
    currentUserId: string;
    selectedUser?: User|null
    onSelectUser: (user:User)=> void
}

const fetchAllUser = async (currentUserId:string):Promise<User[]> => {
   console.log (`[API Mock] Fetching all users except ${currentUserId}...`);
  try {
    const res = await fetch('/api/users');
    if (!res.ok) {
       console.error('Error fetching groups:', res.status, res.statusText);
           const errorData = await res.json();
            console.error('Server error details:', errorData);
            throw new Error(`Failed to fetch users: ${res.statusText}`);
      };
  const data= await res.json();
   const users = Array.isArray(data) ? data : data.users || [];
  return users.filter((user:User) =>user.id !== currentUserId);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

function UserList({currentUserId, selectedUser,onSelectUser}: UserlistProps) {
   const [users, setUsers] = useState<User[]>([]);
  const [{/*isLoading*/}, setIsLoading] = useState(true);
  const [searchQuery, {/*setSearchQuery*/}] = useState("");
  //const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
   const currentUser= currentUserId;
   if (currentUser) {
     fetchAllUser(currentUserId)
     .then(setUsers)
     .catch(err=> console.error('Failed to fetch user:', err))
     .finally(()=> setIsLoading(false));
   }
  },[currentUserId]);


  const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className=" flex flex-col h-full bg-gradient-to-br from-blue-100 via-white to-purple-200 shadow-xl">
       <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
         <h2 className="text-2xl font-bold p-2 mb-2  text-blue-700">
          Contact More Users
        </h2>
       </div>
        <div className=" divide-y divide-gray-400 flex-1 overflow-y-auto space-y-1">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`flex items-center p-4 cursor-pointer transition-all duration-150 rounded-lg${
                selectedUser?.id === user.id
                  ? "bg-blue-200 l-4 border-blue-200"
                  : "hover:bg-blue-200 hover:shadow-sm border-l-4 border-transparent"
              }`}
            >
              <div className="relative flex shrink-0">
                <div className="relative w-10 h-10">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center align-middle text-black font-semibold text-base">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-3 min-w-0 justify-center flex-1">
                  <p
                    className={`text-md font-semibold truncate ${
                      selectedUser?.id === user.id
                        ? "text-blue-800"
                        : "text-gray-900"
                    }`}
                  >
                    {user.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {users.length === 0 && (
          <p className=" text-center text-gray-500 mt-4 text-sm">
            No other users are available to chat.
          </p>
        )}
      </div>
    );
}

export default UserList

/*  {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition duration-150 border-l-4 ${
              selectedUser?.id === user.id
                ? "bg-green-100 border-green-600"
                : "hover:bg-gray-50 border-transparent"
            }`}
          >
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={user.image || "/dp.jpeg"}
                alt={user.name || "User"}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="ml-3">
              <p className="font-semibold text-gray-800 truncate max-w-[150px]">
                {user.name || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500">Click to start chat</p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            No other users are available to chat.
          </p>
        )} */