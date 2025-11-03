import { useState, useEffect } from 'react';
import { Plus, Users, Settings, MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface TeamSpaceManagerProps {
  currentTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
}

export const TeamSpaceManager = ({ currentTeamId, onTeamChange }: TeamSpaceManagerProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'members'>('details');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }

    setTeams(data || []);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: 'Naam vereist',
        description: 'Voer een naam in voor de teamruimte',
        variant: 'destructive',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: newTeamName,
        description: newTeamDescription,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Fout',
        description: 'Kon teamruimte niet aanmaken',
        variant: 'destructive',
      });
      return;
    }

    setCreatedTeamId(data.id);
    setStep('members');
    fetchTeams();
    
    toast({
      title: 'Teamruimte aangemaakt',
      description: `${newTeamName} is succesvol aangemaakt`,
    });
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !createdTeamId) return;

    // First, find the user by email from profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', memberEmail)
      .single();

    if (profileError || !profileData) {
      toast({
        title: 'Gebruiker niet gevonden',
        description: 'Deze gebruiker heeft nog geen account',
        variant: 'destructive',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: createdTeamId,
        user_id: profileData.id,
        role: 'user',
        invited_by: user.id,
      });

    if (error) {
      toast({
        title: 'Fout',
        description: 'Kon lid niet toevoegen',
        variant: 'destructive',
      });
      return;
    }

    setMemberEmail('');
    toast({
      title: 'Lid toegevoegd',
      description: `${memberEmail} is toegevoegd aan het team`,
    });
  };

  const handleFinish = () => {
    setOpen(false);
    setStep('details');
    setNewTeamName('');
    setNewTeamDescription('');
    setMemberEmail('');
    setCreatedTeamId(null);
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-semibold text-muted-foreground">Teamruimtes</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {step === 'details' ? 'Nieuwe Teamruimte' : 'Leden toevoegen'}
              </DialogTitle>
              <DialogDescription>
                {step === 'details' 
                  ? 'Maak een nieuwe teamruimte aan' 
                  : 'Voeg leden toe aan je teamruimte'}
              </DialogDescription>
            </DialogHeader>
            
            {step === 'details' ? (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Mijn teamruimte"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Optionele beschrijving"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateTeam} className="w-full">
                  Doorgaan
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="gebruiker@email.com"
                    />
                    <Button onClick={handleAddMember}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSkip} variant="outline" className="flex-1">
                    Overslaan
                  </Button>
                  <Button onClick={handleFinish} className="flex-1">
                    Voltooien
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        <Button
          variant={currentTeamId === null ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2"
          onClick={() => onTeamChange(null)}
        >
          <Users className="w-4 h-4" />
          <span>Persoonlijk</span>
        </Button>
        
        {teams.map((team) => (
          <div key={team.id} className="flex items-center gap-1">
            <Button
              variant={team.id === currentTeamId ? 'secondary' : 'ghost'}
              className="flex-1 justify-start gap-2"
              onClick={() => onTeamChange(team.id)}
            >
              <Users className="w-4 h-4" />
              <span className="truncate">{team.name}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Leden beheren
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};
